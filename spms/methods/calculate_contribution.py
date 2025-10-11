import frappe

def calculate_contribution_on_submit(doc, method=None):
	doc.calculate_contribution()
	frappe.msgprint(doc.name)