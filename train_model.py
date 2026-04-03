#!/usr/bin/env python
"""
ML Model Training Script

Run this BEFORE starting the Django server to train and save the ML model.

Usage:
    python train_model.py
    
This script will:
    1. Load training_data.csv
    2. Train Random Forest model
    3. Evaluate on test set
    4. Save model and metadata to backend/ml_models/trained_models/
"""

import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'refinery_project.settings')
django.setup()

from ml_models.trainer import MLTrainer

if __name__ == '__main__':
    # Path to training data
    training_data_path = os.path.join(os.path.dirname(__file__), 'training_data.csv')

    if not os.path.exists(training_data_path):
        print(f"ERROR: Training data not found at {training_data_path}")
        print("Please ensure training_data.csv is in the project root directory.")
        sys.exit(1)

    print("="*60)
    print("REFINERY PREDICTIVE MAINTENANCE - ML MODEL TRAINER")
    print("="*60)

    # Create and train model
    trainer = MLTrainer()
    metrics = trainer.train_from_csv(training_data_path)

    # Save trained model
    model_path = trainer.save_model()
    print(f"\n✓ Model successfully trained and saved to: {model_path}")

    # Print feature importance
    importance = trainer.get_feature_importance()
    print("\nFeature Importance (which sensors matter most):")
    for feature, score in sorted(importance.items(), key=lambda x: x[1], reverse=True):
        print(f"  {feature:15s}: {score:.4f} ({score*100:.1f}%)")

    print("\n" + "="*60)
    print("✓ Model training complete! You can now start the Django server.")
    print("="*60)
