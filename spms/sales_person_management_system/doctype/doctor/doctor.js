// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Doctor', {
	refresh:function(frm) {
    	frm.set_query('reference_name', 'doctor_reference', function(doc, cdt, cdn) {
            var d = locals[cdt][cdn];
            return {
        		filters: [
        			['Customer', 'territory', 'in', frm.doc.territory]
        		]
            };
        });
	}
});