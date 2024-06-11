import asyncio

import os
from supabase import create_client, Client

url: str = os.environ.get("https://bdnczrzgqfqqcoxefvqa.supabase.co")
key: str = os.environ.get("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmN6cnpncWZxcWNveGVmdnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NjY1ODAsImV4cCI6MjAzMjQ0MjU4MH0.jXT7lLJj87SBQkUYIfclbt2uA2ISW8XNBDBU8GM7wR0")
supabase: Client = create_client(url, key)


# Define the variable
node_id = 3
pov_value = "North"

async def execute_query():

  # Execute the query
  query = f"""
      SELECT direction
      FROM pictures
      WHERE pov = '{pov_value}'
      AND node_id = {node_id}
  """

  response = await supabase.rpc('sql', {"query": query})

  # Check for errors and print the result
  if response.status_code == 200:
      data = response.payload
      arrow_directions = [row['direction'] for row in data]
  else:
      print("Error:", response.text)

asyncio.run(execute_query())