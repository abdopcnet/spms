import qrcode
import frappe
from frappe.utils import cstr
from random import randint
from datetime import date


def generate_qrcode(site_name, route_name):
    """
    It generates a QR code image and saves it in the private/files folder of the site

    :param site_name: The name of the site you want to generate the QR code for
    :param route_name: The name of the route you want to generate the QR code for
    :return: The file path of the QR code image.
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
    )
    qr.add_data(f'{site_name}/{route_name}')
    qr.make(fit=True)
    # Generating a random number between 1 and 100000 and then appending the current date to it.
    file_name = randint(1, 100000)
    file_name = f'{file_name}.{date.today()}'

    img = qr.make_image(fill_color="black", back_color="white")

    # Saving the QR code image in the private/files folder of the site.
    current_site_name = cstr(frappe.local.site)
    img.save(f"{current_site_name}/private/files/{file_name}.png")

    # Returning the file path of the QR code image.
    return (f"/private/files/{file_name}.png")