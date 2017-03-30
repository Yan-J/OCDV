from django.conf.urls import url
from . import views

urlpatterns = [
    url(r'^calendar', views.calendar, name='calendar'),
    url(r'enterance', views.enterance, name='enterance'),
    url(r'^escape', views.escape, name='escape'),
    url(r'^FAQs.html', views.faq),
    url(r'^fjc', views.fjc, name='fjc'),
    url(r'^incident-log.html',views.incident_log,name='incident'),
    url(r'^index', views.index, name='index'),
    url(r'^log-in.html', views.login),
    url(r'^nyc', views.nyc),
    url(r'^tour-manhattan.html', views.tour_manhattan),
    url(r'^phone-safe.html', views.phoneSafe),
    url(r'^portal', views.portal, name='portal'),
    url(r'^prepare-visit.html', views.prepare),
    url(r'^registration.html', views.reg),
    url(r'^google', views.secret, name='secret'),
    url(r'^testimonial.html', views.testimonial, name='testimonial'),
    url(r'^testimonial1.html', views.testimonial1, name='testimonial1'),
    url(r'^tip-remove.html', views.tipR),
    url(r'^', views.index),
]