# Generated by Django 5.1.1 on 2024-10-23 11:05

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('rentals', '0002_bike_image'),
    ]

    operations = [
        migrations.AlterField(
            model_name='bike',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='images/'),
        ),
    ]
