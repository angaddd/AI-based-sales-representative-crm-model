import os
import sys
import django
from datetime import timedelta

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

import numpy as np
import pandas as pd
from django.utils import timezone
from django.db.models import Q, Count, Sum, Avg
from sklearn.preprocessing import StandardScaler

from crm.models import Lead, Event, LeadScore, Recommendation
from accounts.models import Company, CompanyUser


class LeadScoringEngine:
    """
    AI-powered lead scoring engine that processes behavioral data
    and generates scores and recommendations.
    """
    
    def __init__(self, company_id):
        self.company_id = company_id
        self.version = "1.0"
    
    def score_all_leads(self):
        """Score all active leads for the company"""
        leads = Lead.objects.filter(company_id=self.company_id)
        results = []
        
        for lead in leads:
            score_result = self.calculate_lead_score(lead)
            results.append(score_result)
        
        return results
    
    def calculate_lead_score(self, lead):
        """
        Calculate comprehensive score for a lead based on behavioral data.
        Score range: 0-100
        """
        
        # Get events for this lead
        events = Event.objects.filter(lead=lead).order_by('-timestamp')
        
        if not events.exists():
            return {
                'lead_id': lead.id,
                'score': 0,
                'temperature': 'cold',
                'conversion_rate': 0.0
            }
        
        # Calculate individual components
        components = {
            'engagement_score': self._calculate_engagement_score(lead, events),
            'intent_score': self._calculate_intent_score(events),
            'recency_score': self._calculate_recency_score(lead),
            'frequency_score': self._calculate_frequency_score(lead, events),
            'behavior_score': self._calculate_behavior_score(events),
        }
        
        # Weighted sum of components
        weights = {
            'engagement_score': 0.2,
            'intent_score': 0.35,
            'recency_score': 0.15,
            'frequency_score': 0.2,
            'behavior_score': 0.1,
        }
        
        total_score = sum(components[key] * weights[key] for key in weights.keys())
        
        # Normalize to 0-100
        total_score = int(max(0, min(100, total_score)))
        
        # Determine temperature
        temperature = self._classify_temperature(total_score)
        
        # Estimate conversion rate
        conversion_rate = self._estimate_conversion_rate(components, total_score)
        
        # Update lead
        lead.score = total_score
        lead.temperature = temperature
        lead.conversion_rate = conversion_rate
        lead.save(update_fields=['score', 'temperature', 'conversion_rate', 'updated_at'])
        
        # Record score history
        LeadScore.objects.create(
            company_id=self.company_id,
            lead=lead,
            score=total_score,
            temperature=temperature,
            contributing_events=events.count(),
            engine_version=self.version
        )
        
        return {
            'lead_id': lead.id,
            'score': total_score,
            'temperature': temperature,
            'conversion_rate': conversion_rate,
            'components': components
        }
    
    def _calculate_engagement_score(self, lead, events):
        """Score based on engagement (visits, clicks, time spent)"""
        # Normalize metrics
        visits = lead.total_visits
        clicks = lead.total_clicks
        time_spent = min(lead.time_spent_seconds / 3600, 10)  # Cap at 10 hours
        
        # Base score from engagement
        engagement = (visits * 5) + (clicks * 2) + (time_spent * 10)
        
        # Cap at 100
        return min(100, engagement)
    
    def _calculate_intent_score(self, events):
        """Score based on purchase intent signals"""
        high_intent = events.filter(intent_signal='high').count()
        medium_intent = events.filter(intent_signal='medium').count()
        
        # High intent events weighted more
        intent_score = (high_intent * 40) + (medium_intent * 20)
        
        return min(100, intent_score)
    
    def _calculate_recency_score(self, lead):
        """Score based on how recently user was active"""
        now = timezone.now()
        
        if not lead.last_activity:
            last_activity = lead.last_seen
        else:
            last_activity = lead.last_activity
        
        days_since_activity = (now - last_activity).days
        
        if days_since_activity == 0:
            return 100  # Active today
        elif days_since_activity <= 7:
            return 80   # Active this week
        elif days_since_activity <= 30:
            return 50   # Active this month
        elif days_since_activity <= 90:
            return 20   # Active this quarter
        else:
            return 5    # Inactive
    
    def _calculate_frequency_score(self, lead, events):
        """Score based on visit frequency"""
        # Calculate visits over time periods
        now = timezone.now()
        
        # Events in last 7 days
        week_events = events.filter(
            timestamp__gte=now - timedelta(days=7)
        ).count()
        
        # Events in last 30 days
        month_events = events.filter(
            timestamp__gte=now - timedelta(days=30)
        ).count()
        
        frequency_score = (week_events * 15) + (month_events * 5)
        
        return min(100, frequency_score)
    
    def _calculate_behavior_score(self, events):
        """Score based on specific behaviors"""
        behavior_scores = {
            'add_to_cart': 25,
            'complete_purchase': 100,
            'start_checkout': 30,
            'view_product': 10,
            'form_submit': 20,
            'remove_from_cart': -15,
        }
        
        total_behavior_score = 0
        for event_type, points in behavior_scores.items():
            count = events.filter(event_type=event_type).count()
            total_behavior_score += count * points
        
        # Normalize
        return min(100, max(0, total_behavior_score))
    
    def _classify_temperature(self, score):
        """Classify lead temperature based on score"""
        if score >= 70:
            return 'hot'
        elif score >= 40:
            return 'warm'
        else:
            return 'cold'
    
    def _estimate_conversion_rate(self, components, score):
        """Estimate conversion probability"""
        # Higher intent and engagement = higher conversion probability
        intent_factor = components['intent_score'] / 100
        engagement_factor = components['engagement_score'] / 100
        behavior_factor = components['behavior_score'] / 100
        
        # Weighted average
        conversion_rate = (
            (intent_factor * 0.4) +
            (engagement_factor * 0.35) +
            (behavior_factor * 0.25)
        )
        
        return round(conversion_rate, 3)
    
    def generate_recommendations(self):
        """Generate AI recommendations for sales actions"""
        leads = Lead.objects.filter(company_id=self.company_id).exclude(
            temperature='cold'
        ).order_by('-score')
        
        recommendations_created = 0
        
        for lead in leads:
            recs = self._generate_lead_recommendations(lead)
            recommendations_created += len(recs)
        
        return recommendations_created
    
    def _generate_lead_recommendations(self, lead):
        """Generate recommendations for a specific lead"""
        events = Event.objects.filter(lead=lead)
        recommendations = []
        
        # Check if recommendation already exists and is active
        active_recs = Recommendation.objects.filter(
            lead=lead,
            is_actioned=False,
            is_dismissed=False,
            expires_at__gt=timezone.now()
        ).count()
        
        if active_recs >= 3:
            return []  # Don't create more than 3 active recommendations
        
        expires_at = timezone.now() + timedelta(days=7)
        
        # Rule 1: Hot leads without contact - suggest calling
        if lead.temperature == 'hot' and not lead.assigned_to:
            rec = Recommendation.objects.create(
                company_id=self.company_id,
                lead=lead,
                recommendation_type='call',
                priority='urgent',
                title='Call Hot Lead Immediately',
                description=f'{lead.get_full_name()} is showing high purchase intent. Contact them now.',
                confidence_score=0.95,
                reasoning='High intent signals with no recent outreach',
                expires_at=expires_at
            )
            recommendations.append(rec)
        
        # Rule 2: Warm leads - suggest email follow-up
        elif lead.temperature == 'warm' and events.filter(event_type='page_view').count() > 5:
            rec = Recommendation.objects.create(
                company_id=self.company_id,
                lead=lead,
                recommendation_type='email',
                priority='high',
                title='Send Nurture Email',
                description=f'{lead.get_full_name()} has shown sustained interest. Send targeted email.',
                confidence_score=0.75,
                reasoning='Multiple visits and medium intent over time',
                expires_at=expires_at
            )
            recommendations.append(rec)
        
        # Rule 3: Cart abandonment - suggest retargeting
        if events.filter(event_type='add_to_cart').exists() and not events.filter(
            event_type='complete_purchase'
        ).exists():
            rec = Recommendation.objects.create(
                company_id=self.company_id,
                lead=lead,
                recommendation_type='retarget',
                priority='high',
                title='Retarget Cart Abandonment',
                description='Send reminder about items in cart with incentive offer.',
                confidence_score=0.85,
                reasoning='Items added to cart but purchase not completed',
                expires_at=expires_at
            )
            recommendations.append(rec)
        
        # Rule 4: Demo/Product interest - suggest scheduling demo
        if events.filter(event_type='view_product').count() > 3 and lead.temperature in ['warm', 'hot']:
            rec = Recommendation.objects.create(
                company_id=self.company_id,
                lead=lead,
                recommendation_type='demo',
                priority='medium',
                title='Offer Product Demo',
                description='Lead has viewed multiple products. Offer personalized demo.',
                confidence_score=0.7,
                reasoning='High product exploration with interest signals',
                expires_at=expires_at
            )
            recommendations.append(rec)
        
        return recommendations


def run_scoring():
    """Run scoring for all companies"""
    companies = Company.objects.filter(is_active=True)
    
    for company in companies:
        print(f"\nScoring leads for {company.name}...")
        
        engine = LeadScoringEngine(company.id)
        
        # Score all leads
        results = engine.score_all_leads()
        print(f"  Scored {len(results)} leads")
        
        # Generate recommendations
        rec_count = engine.generate_recommendations()
        print(f"  Generated {rec_count} recommendations")


if __name__ == '__main__':
    run_scoring()
