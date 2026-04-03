# Generated migration

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('machines', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='MaintenanceReport',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('report_date', models.DateField(auto_now_add=True)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField()),
                ('total_readings', models.IntegerField(default=0)),
                ('failure_predictions', models.IntegerField(default=0)),
                ('failure_rate', models.FloatField(default=0.0, help_text='Percentage of readings predicting failure')),
                ('avg_temperature', models.FloatField(default=0.0)),
                ('avg_pressure', models.FloatField(default=0.0)),
                ('avg_vibration', models.FloatField(default=0.0)),
                ('avg_flow_rate', models.FloatField(default=0.0)),
                ('avg_humidity', models.FloatField(default=0.0)),
                ('alerts_triggered', models.IntegerField(default=0)),
                ('critical_alerts', models.IntegerField(default=0)),
                ('recommendations', models.TextField(blank=True)),
                ('maintenance_priority', models.CharField(choices=[('LOW', 'Low'), ('MEDIUM', 'Medium'), ('HIGH', 'High'), ('CRITICAL', 'Critical')], default='LOW', max_length=20)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('machine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='machines.machine')),
            ],
            options={
                'ordering': ['-report_date'],
            },
        ),
        migrations.AddIndex(
            model_name='maintenancereport',
            index=models.Index(fields=['machine', '-report_date'], name='reports_main_machine_idx'),
        ),
    ]
