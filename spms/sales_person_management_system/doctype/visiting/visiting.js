// Copyright (c) 2022, aoai and contributors
// For license information, please see license.txt

frappe.ui.form.on('Visiting', {
    visit_goal: function(frm) {
        // Ensure visit_goal field has a value
        if (frm.doc.visit_goal) {
            // Call the function to get the filtered doctors for the selected visit_goal
            frappe.call({
                method: "spms.sales_person_management_system.doctype.visiting.visiting.get_doctors_from_visit_goal",
                args: {
                    visit_goal_id: frm.doc.visit_goal  // Pass the visit_goal ID
                },
                callback: function(r) {
                    if (r.message) {
                        const doctors = r.message;  // List of doctors for the visit_goal

                        // Update the query for doctor_name field to only show the fetched doctors
                        frm.set_query("doctor_name", function() {
                            return {
                                filters: [
                                    ["Doctor", "name", "in", doctors]
                                ]
                            };
                        });
                    }
                }
            });
        } else {
            // If no visit_goal is selected, clear the doctor_name filter
            frm.set_query("doctor_name", function() {
                return {};
            });
        }
    }
});


frappe.ui.form.on('Visiting', {
    // Button to fetch items and populate visiting_item child table
    refresh: function(frm) {
        // Add custom button "Fetch Items"
        frm.add_custom_button(__('Fetch Items'), function() {
            if (frm.doc.visit_goal && frm.doc.doctor_name) {
                // Call the Python method to fetch items for the doctor from the visit_goal
                frappe.call({
                    method: "spms.sales_person_management_system.doctype.visiting.visiting.get_items_for_doctor_from_visit_goal",
                    args: {
                        visit_goal_id: frm.doc.visit_goal,  // Pass the visit_goal ID
                        doctor_name: frm.doc.doctor_name  // Pass the doctor_name
                    },
                    callback: function(r) {
                        if (r.message) {
                            const items = r.message;  // List of items fetched for the doctor

                            // Clear existing rows in visiting_item child table
                            frm.clear_table('visiting_item');

                            // Add new rows in visiting_item child table with fetched items
                            items.forEach(function(item) {
                                let row = frm.add_child('visiting_item');
                                row.item_code = item;  // Set the item_code field with the fetched item
                            });

                            // Refresh the child table to display the new items
                            frm.refresh_field('visiting_item');
                        } else {
                            frappe.msgprint(__('No items found for the selected doctor.'));
                        }
                    }
                });
            } else {
                frappe.msgprint(__('Please select both Visit Goal and Doctor.'));
            }
        });
    }
});






// جلب الموقع من المستخدم
frappe.ui.form.on('Visiting', {
    onload(frm) {
        function onPositionReceived(position) {
            var longitude = position.coords.longitude;
            var latitude = position.coords.latitude;
            frm.set_value('longitude', longitude);
            frm.set_value('latitude', latitude);
            fetch('https://api.opencagedata.com/geocode/v1/json?q=' + latitude + '+' + longitude + '&key=de1bf3be66b546b89645e500ec3a3a28')
                .then(response => response.json())
                .then(data => {
                    var address = data['results'][0].formatted;
                    frm.set_value('current_address', address);
                })
                .catch(err => console.log(err));
            frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + latitude + ',' + longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe></div></div>');
            frm.refresh_field('my_location');
        }

        function locationNotReceived(positionError) {
            console.log(positionError);
        }

        if (frm.doc.longitude && frm.doc.latitude) {
            frm.set_df_property('my_location', 'options', '<div class="mapouter"><div class="gmap_canvas"><iframe width=100% height="300" id="gmap_canvas" src="https://maps.google.com/maps?q=' + frm.doc.latitude + ',' + frm.doc.longitude + '&t=&z=17&ie=UTF8&iwloc=&output=embed" frameborder="0" scrolling="no" marginheight="0" marginwidth="0"></iframe></div></div>');
            frm.refresh_field('my_location');
        } else {
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(onPositionReceived, locationNotReceived, { enableHighAccuracy: true });
            } else {
                frappe.msgprint('من فضلك قم بتفعيل خدمة الموقع');
            }
        }
    },

    // التحقق من وجود الموقع قبل الحفظ
    before_save: function (frm) {
        if (!frm.doc.longitude && !frm.doc.latitude) {
            frappe.msgprint('من فضلك قم بتفعيل خدمة الموقع');
        }
    }
});



