import json
from django.http import JsonResponse
import firebase_admin
from firebase_admin import firestore

def EmployeesView(request):
    db = firestore.client()
    
    employees = db.collection('employees').stream()
    e = []
    for employee in employees:
        e.append(employee.to_dict())
        
    if len(e) == 0:
        return JsonResponse(['NO DATA!!!'], safe=False)
    
    return JsonResponse(e, safe=False)