from supabase import create_client, Client

url = "https://bdnczrzgqfqqcoxefvqa.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmN6cnpncWZxcWNveGVmdnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NjY1ODAsImV4cCI6MjAzMjQ0MjU4MH0.jXT7lLJj87SBQkUYIfclbt2uA2ISW8XNBDBU8GM7wR0"

supabase: Client = create_client(url, key)


# Define the variable
node_id = 3
pov_value = "East"

#done

table = supabase.table("pictures")
# Execute the query
query = table.select("direction").filter("pov", "eq", pov_value).filter("node_id", "eq", node_id)

"""try:
    response = supabase.rpc("run_query", {
        "query": query,
        "variables": [pov_value, node_id]
    })
    data = response.execute().get('data')
    if data:
        arrow_directions = [row['direction'] for row in data]
        print(arrow_directions)
    else:
        print("No Data Returned")
except Exception as e:
    print(f"Unexpected Error: {e}")
    """

"""try:
    response = supabase.rpc("run_query", {
        "query": query
    })
    data = response.get('data')
    if data:
        arrow_directions = [row['direction'] for row in data]
        print(arrow_directions)
    else:
        print("No Data Returned")
except Exception as e:
    print(f"Unexpected Error: {e}")"""

try:
    # Execute the query
    response = query.execute()
    data = response.data

    if data:
        arrow_directions = [row['direction'] for row in data]
        print("Retrieved arrow directions:", arrow_directions)
    else:
        print("No Data Returned")
except Exception as e:
    print(f"Error: {e}")