import os
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import joblib
from django.conf import settings


class MLTrainer:
    """
    Trains the Random Forest model on historical sensor data.
    
    Usage:
        trainer = MLTrainer()
        trainer.train_from_csv('../training_data.csv')
        metrics = trainer.get_metrics()
    """

    def __init__(self):
        self.model = None
        self.feature_columns = ['temperature', 'pressure', 'vibration', 'flow_rate', 'humidity']
        self.target_column = 'failure'
        self.metrics = {}
        self.X_test = None
        self.y_test = None

    def train_from_csv(self, csv_path, test_size=0.2, random_state=42):
        """
        Train model from CSV file.
        
        Args:
            csv_path: Path to training_data.csv
            test_size: Fraction for test split (default 0.2 = 80/20 train/test)
            random_state: Random seed for reproducibility
        """
        print(f"Loading data from {csv_path}...")
        df = pd.read_csv(csv_path)

        # Extract features and target
        X = df[self.feature_columns]
        y = df[self.target_column]

        print(f"Data shape: {X.shape}")
        print(f"Failure distribution:\n{y.value_counts()}")

        # Split into train/test
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=random_state, stratify=y
        )

        # Train Random Forest model
        print("Training Random Forest model...")
        self.model = RandomForestClassifier(
            n_estimators=100,           # 100 trees
            max_depth=15,               # Prevent overfitting
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1,                  # Use all CPU cores
            class_weight='balanced'     # Handle class imbalance
        )

        self.model.fit(X_train, y_train)

        # Evaluate on test set
        y_pred = self.model.predict(X_test)
        self.X_test = X_test
        self.y_test = y_test

        self.metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred),
            'recall': recall_score(y_test, y_pred),
            'f1': f1_score(y_test, y_pred),
            'confusion_matrix': confusion_matrix(y_test, y_pred).tolist(),
        }

        print(f"\nModel Metrics:")
        print(f"  Accuracy:  {self.metrics['accuracy']:.4f}")
        print(f"  Precision: {self.metrics['precision']:.4f}")
        print(f"  Recall:    {self.metrics['recall']:.4f}")
        print(f"  F1-Score:  {self.metrics['f1']:.4f}")

        return self.metrics

    def save_model(self, model_name='refinery_model.joblib'):
        """Save trained model to disk"""
        if self.model is None:
            raise ValueError("No model trained yet. Call train_from_csv() first.")

        # Create models directory if doesn't exist
        models_dir = os.path.join(settings.ML_MODELS_DIR)
        os.makedirs(models_dir, exist_ok=True)

        model_path = os.path.join(models_dir, model_name)
        joblib.dump(self.model, model_path)
        print(f"Model saved to {model_path}")

        # Also save feature columns metadata
        metadata = {
            'feature_columns': self.feature_columns,
            'target_column': self.target_column,
            'metrics': self.metrics,
        }
        metadata_path = os.path.join(models_dir, 'model_metadata.joblib')
        joblib.dump(metadata, metadata_path)

        return model_path

    def get_metrics(self):
        """Return model evaluation metrics"""
        return self.metrics

    def get_feature_importance(self):
        """Return feature importance from trained model"""
        if self.model is None:
            return None

        return dict(zip(
            self.feature_columns,
            self.model.feature_importances_
        ))
