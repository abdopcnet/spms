# Copyright (c) 2022, aoai and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class VisitGoal(Document):
	def before_save(self) -> None:
		"""
		if doc.number_of_days == 0:
    		frappe.throw("Please, can't be set 0 day for Taget")
    
		if doc.number_of_days < 0:
    		frappe.throw("Please, Insert Valid Period for Taget")
		"""
		if self.number_of_days == 0:
			frappe.throw("Please, can't be set 0 day for Target")
		elif self.number_of_days < 0:
			frappe.throw("Please, Insert Valid Period for Target")
