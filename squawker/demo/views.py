# Create your views here.
from django.shortcuts import render
from django.utils import timezone
from django.http import HttpResponseBadRequest
from django.template import loader
from django.shortcuts import redirect

from .models import Squawk
from .models import Calendar

def calendar(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    if len(request.POST) > 0:
        t = Calendar(cal_date=request.POST['cday'],cal_time=request.POST.get('ctime',False),cal_place=request.POST.get('place',False),cal_people=request.POST.get('people',False),cal_text=request.POST.get('appoint',False),cal_email=request.POST['email'], pub_date=timezone.now())
        t.save()

    cal_list = Calendar.objects.order_by('-pub_date')
    context = {
        'cal_list': cal_list,
        }
    return render(request, 'demo/calendar.html', context)

def enterance(request):
    request.session['IS_LOGIN'] = True
    return redirect('index.html')

def escape(request):
    request.session['IS_LOGIN'] = False
    return redirect('http://news.yahoo.com')

def faq(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/FAQs.html')

def fjc(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/fjc.html')

def incident_log(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    if len(request.POST) > 0:
        s = request.POST['squawk']
        if len(s) == 0 or len(s) > 140:
            return HttpResponseBadRequest

        t = Squawk(squawk_date=request.POST.get('bday',False),squawk_time=request.POST.get('category1',False),squawk_place=request.POST.get('category2',False),squawk_type1=False,squawk_type2=False,squawk_text=request.POST.get('squawk',False), pub_date=timezone.now())
        if request.POST.has_key("copy"):
            t.squawk_type1 = True
        if request.POST.has_key("human"):
            t.squawk_type2 = True
        t.save()

    squawk_list = Squawk.objects.order_by('-pub_date')
    context = {
        'squawk_list': squawk_list,
        }
    return render(request, 'demo/incident-log.html', context)

def index(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/index.html')

def login(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/log-in.html')

def nyc(request):
    return render(request, 'demo/nycgov.html')

def phoneSafe(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/phone-safe.html')

def portal(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/portal.html')

def prepare(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/prepare-visit.html')

def reg(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/registration.html')

def secret(request):
    return render(request, 'demo/Google.html')

def testimonial(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/testimonial.html')

def testimonial1(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/testimonial1.html')

def tipR(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/tip-remove.html')

def tour_manhattan(request):
    state = request.session.get('IS_LOGIN',False)
    if not(state):
        return redirect('http://google.com')

    return render(request, 'demo/tour-manhattan.html')