import os
import sqlite3
import subprocess
import hashlib
import pickle
import requests


# 1. SQL Injection
def get_user(username):
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()

    query = "SELECT * FROM users WHERE username = '" + username + "'"

    cursor.execute(query)
    return cursor.fetchall()


# 2. Command Injection
def ping_host(host):
    command = "ping -c 4 " + host
    result = os.system(command)

    return result


# 3. OS Command Injection
def execute_command(user_input):
    result = subprocess.run(
        user_input,
        shell=True,
        capture_output=True,
        text=True
    )

    return result.stdout


# 4. Weak Hashing
def hash_password(password):
    return hashlib.md5(password.encode()).hexdigest()


# 5. Hardcoded Secret
API_KEY = "sk_test_123456789abcdef"


def get_api_key():
    return API_KEY


# 6. Insecure Deserialization
def load_user_data(data):
    return pickle.loads(data)


# 7. SSRF
def fetch_url(url):
    response = requests.get(url)

    return response.text


# 8. Missing Timeout
def call_external_service(url):
    response = requests.get(url)

    return response.json()


# 9. Exception Swallowing / Code Smell
def process_file(filename):
    try:
        with open(filename, "r") as file:
            data = file.read()

        return data

    except Exception:
        pass


# 10. Broad Exception Handling
def calculate(value):
    try:
        result = 100 / value
        return result

    except Exception:
        return None


# 11. Dead Code / Unused Variable
def calculate_total(items):
    total = 0
    unused_variable = "test"

    for item in items:
        total += item

    return total


# 12. High Cyclomatic Complexity / Code Smell
def get_user_type(age, country, is_admin, is_active):

    if age > 18:
        if country == "US":
            if is_admin:
                if is_active:
                    return "ADMIN_ACTIVE"
                else:
                    return "ADMIN_INACTIVE"
            else:
                if is_active:
                    return "USER_ACTIVE"
                else:
                    return "USER_INACTIVE"

        elif country == "IN":
            if is_admin:
                return "INDIA_ADMIN"
            else:
                return "INDIA_USER"

        else:
            if is_active:
                return "OTHER_ACTIVE"
            else:
                return "OTHER_INACTIVE"

    else:
        return "MINOR"


# 13. Mutable Default Argument
def add_role(role, roles=[]):
    roles.append(role)
    return roles


# 14. Insecure Randomness
import random

def generate_token():
    return str(random.randint(100000, 999999))


# 15. Path Traversal
def read_user_file(filename):
    path = "/var/app/uploads/" + filename

    with open(path, "r") as file:
        return file.read()


# 16. Debug Information / Sensitive Data Exposure
def login(username, password):
    print("Login attempt:", username, password)

    return True


# 17. Hardcoded Credentials
def connect_database():
    username = "admin"
    password = "Admin@123"

    return sqlite3.connect("application.db")


# 18. Inefficient Loop / Code Smell
def find_duplicates(items):
    duplicates = []

    for item in items:
        if item in items:
            count = 0

            for other in items:
                if item == other:
                    count += 1

            if count > 1:
                duplicates.append(item)

    return duplicates


# 19. Too Many Parameters / Code Smell
def create_customer(
    first_name,
    last_name,
    email,
    phone,
    address,
    city,
    state,
    country,
    zipcode,
    age
):
    return {
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "address": address,
        "city": city,
        "state": state,
        "country": country,
        "zipcode": zipcode,
        "age": age
    }


# 20. Dangerous eval()
def calculate_expression(expression):
    return eval(expression)
