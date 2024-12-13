import mysql.connector
from mysql.connector import Error
from typing import List, Optional, Tuple, Any

# Utility to establish a connection to the database
def get_connection() -> Optional[mysql.connector.MySQLConnection]:
    try:
        connection = mysql.connector.connect(
            host='localhost',
            database='university_clinic_inventoryv2',
            user='root',
            password=''
        )
        print('Successful connection!')
        return connection
    except Error as e:
        print(f"Error connecting to MySQL: {e}")
        return None

# Function to fetch a single result
def fetch_one(query: str, params: Tuple) -> Optional[Any]:
    connection = get_connection()
    if not connection:
        return None
    try:
        cursor = connection.cursor()
        cursor.execute(query, params)
        result = cursor.fetchone()
        return result
    except Error as e:
        print(f"Error fetching data: {e}")
        return None
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to fetch multiple results
def fetch_all(query: str, params: Tuple = ()) -> List[Tuple]:
    connection = get_connection()
    if not connection:
        return []
    try:
        cursor = connection.cursor()
        cursor.execute(query, params)
        results = cursor.fetchall()
        return results
    except Error as e:
        print(f"Error fetching data: {e}")
        return []
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Function to execute a query (INSERT, UPDATE, DELETE)
def execute_query(query: str, params: Tuple) -> bool:
    connection = get_connection()
    if not connection:
        return False
    try:
        cursor = connection.cursor()
        cursor.execute(query, params)
        connection.commit()
        return True
    except Error as e:
        print(f"Error executing query: {e}")
        return False
    finally:
        if connection.is_connected():
            cursor.close()
            connection.close()

# Check the stock quantity of an item
def check_stock(item_name: str) -> Optional[int]:
    query = "SELECT quantity_in_stock FROM inventory_items WHERE name = %s"
    result = fetch_one(query, (item_name,))
    return result[0] if result else None

# Check items expiring on or before a given date
def check_expiry(date: str) -> List[Tuple]:
    query = "SELECT name, expiry_date FROM batches WHERE expiry_date <= %s"
    return fetch_all(query, (date,))

# Set a reorder alert threshold for an item
def set_alert(item_name: str, threshold: int) -> bool:
    query = "UPDATE inventory_items SET reorder_level = %s WHERE name = %s"
    return execute_query(query, (threshold, item_name))

# Update the stock quantity of an item
def update_stock(item_name: str, quantity: int) -> bool:
    query = "UPDATE inventory_items SET quantity_in_stock = %s WHERE name = %s"
    return execute_query(query, (quantity, item_name))

# Get all items below their reorder threshold
def get_items_below_threshold() -> List[Tuple]:
    query = """
        SELECT name, quantity_in_stock, reorder_level 
        FROM inventory_items 
        WHERE quantity_in_stock < reorder_level
    """
    return fetch_all(query)
