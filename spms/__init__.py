
__version__ = "16.12.2025"

from erpnext.controllers.selling_controller import SellingController
# Use relative import instead of absolute import
from .methods.override_calculate_contribution_function import calculate_contribution

SellingController.calculate_contribution = calculate_contribution
