from setuptools import setup, find_packages
import os
import re

with open("requirements.txt") as f:
	install_requires = f.read().strip().split("\n")

# Read version from __init__.py without importing the module
def get_version():
	init_file = os.path.join(os.path.dirname(__file__), "spms", "__init__.py")
	with open(init_file, "r") as f:
		content = f.read()
		version_match = re.search(r"^__version__ = ['\"]([^'\"]*)['\"]", content, re.M)
		if version_match:
			return version_match.group(1)
	raise RuntimeError("Unable to find version string.")

setup(
	name="spms",
	version=get_version(),
	description="Sales Person Management System",
	author="aoai",
	author_email="info@aoai.io",
	packages=find_packages(),
	zip_safe=False,
	include_package_data=True,
	install_requires=install_requires
)
