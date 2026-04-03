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
            name='MaintenanceAlert',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('alert_type', models.CharField(max_length=50)),
                ('severity', models.CharField(choices=[('INFO', 'Information'), ('WARNING', 'Warning'), ('CRITICAL', 'Critical')], default='WARNING', max_length=20)),
                ('status', models.CharField(choices=[('OPEN', 'Open'), ('ACKNOWLEDGED', 'Acknowledged'), ('RESOLVED', 'Resolved')], default='OPEN', max_length=20)),
                ('title', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('triggered_at', models.DateTimeField(auto_now_add=True)),
                ('acknowledged_at', models.DateTimeField(blank=True, null=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('recommended_action', models.TextField(blank=True)),
                ('machine', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='alerts', to='machines.machine')),
                ('sensor_reading', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='machines.sensorreading')),
            ],
            options={
                'ordering': ['-triggered_at'],
            },
        ),
        migrations.AddIndex(
            model_name='maintenancealert',
            index=models.Index(fields=['machine', '-triggered_at'], name='alerts_main_machine_idx'),
        ),
        migrations.AddIndex(
            model_name='maintenancealert',
            index=models.Index(fields=['status', '-triggered_at'], name='alerts_main_status_idx'),
        ),
    ]
