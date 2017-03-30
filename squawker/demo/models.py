from django.db import models

# Create your models here.


class Squawk(models.Model):
    squawk_date = models.CharField(max_length=141)
    squawk_time = models.CharField(max_length=141)
    squawk_place = models.CharField(max_length=141)
    squawk_type1 = models.BooleanField()
    squawk_type2 = models.BooleanField()
    squawk_text = models.CharField(max_length=141)
    pub_date = models.DateTimeField('date published')

    #def __str__(self):
    #return self.squawk_text
class Calendar(models.Model):
    cal_date = models.CharField(max_length=141)
    cal_time = models.CharField(max_length=141)
    cal_place = models.CharField(max_length=141)
    cal_people = models.CharField(max_length=141)
    cal_text = models.CharField(max_length=141)
    cal_email = models.CharField(max_length=141)
    pub_date = models.DateTimeField('date published')
