import frappe
from frappe.website.website_generator import WebsiteGenerator

class Visiting(WebsiteGenerator):
    pass

@frappe.whitelist()
def get_doctors_from_visit_goal(visit_goal_id):
    # Fetch doctors from the child table `doctor_visit_goal` in `visit_goal` document
    doctors = frappe.db.sql("""
        SELECT doctor 
        FROM `tabDoctor Visit Goal`
        WHERE parent = %s
        GROUP BY doctor
    """, (visit_goal_id,), as_list=True)

    # Return the list of doctor names
    return [doctor[0] for doctor in doctors]  # List of doctors
  
@frappe.whitelist()
def get_items_for_doctor_from_visit_goal(visit_goal_id, doctor_name):
    # Fetch items from doctor_visit_goal where doctor matches the selected doctor_name
    items = frappe.db.sql("""
        SELECT item
        FROM `tabDoctor Visit Goal`
        WHERE parent = %s AND doctor = %s
    """, (visit_goal_id, doctor_name), as_list=True)

    # Return the list of items
    return [item[0] for item in items]  # List of items