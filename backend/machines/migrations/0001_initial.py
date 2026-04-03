# Generated migration

from django.db import migrations, models
import django.db.models.deletion
import django.core.validators


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name='Machine',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('machine_id', models.CharField(help_text='Unique machine identifier (e.g., PUMP_1)', max_length=50, unique=True)),
                ('name', models.CharField(max_length=100)),
                ('machine_type', models.CharField(choices=[('PUMP', 'Pump'), ('COMPRESSOR', 'Compressor'), ('VALVE', 'Valve'), ('PIPELINE', 'Pipeline'), ('TURBINE', 'Turbine')], max_length=20)),
                ('location', models.CharField(blank=True, max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
            ],
            options={
                'ordering': ['machine_id'],
            },
        ),
        migrations.CreateModel(
            name='SensorReading',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('timestamp', models.DateTimeField(auto_now_add=True, help_text='Auto-set by backend')),
                ('temperature', models.FloatField(validators=[django.core.validators.MinValueValidator(10), django.core.validators.MaxValueValidator(150)])),
                ('pressure', models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('vibration', models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(50)])),
                ('flow_rate', models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(5000)])),
                ('humidity', models.FloatField(validators=[django.core.validators.MinValueValidator(0), django.core.validators.MaxValueValidator(100)])),
                ('failure_predicted', models.BooleanField(default=False)),
                ('failure_confidence', models.FloatField(default=0.0, help_text='Confidence (0-1)')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('machine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sensor_readings', to='machines.machine')),
            ],
            options={
                'ordering': ['-timestamp'],
            },
        ),
        migrations.AddIndex(
            model_name='sensorreading',
            index=models.Index(fields=['machine', '-timestamp'], name='machines_se_machine_idx'),
        ),
    ]
