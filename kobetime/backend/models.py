class Employee:
    def __init__(self, name, email, passcode, admin=False):
        self.name = name
        self.email = email
        self.passcode = passcode
        self.admin = admin
    
    def to_dict(self):
        return {
            'name':self.name,
            'email':self.email,
            'passcode':self.passcode,
            'admin':self.admin,
        }
        
class TimeEntry:
    def __init__(self, clock_in, clock_out, employee_id):
        self.clock_in = clock_in
        self.clock_out = clock_out
        self.employee_id = employee_id