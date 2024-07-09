from PIL import Image
import os

from supabase import create_client, Client

url = "https://bdnczrzgqfqqcoxefvqa.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJkbmN6cnpncWZxcWNveGVmdnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTY4NjY1ODAsImV4cCI6MjAzMjQ0MjU4MH0.jXT7lLJj87SBQkUYIfclbt2uA2ISW8XNBDBU8GM7wR0"

supabase: Client = create_client(url, key)
table = supabase.table("pictures")

folder_path = "./Images_to_be_processed"

# Opening arrow to add on top

arrow_directory = "-arrow.png"

for file_name in os.listdir(folder_path):

    img_file_path = os.path.join(folder_path, file_name)

    if os.path.isfile(img_file_path):
        base_name, extension = os.path.splitext(file_name)
        parts = base_name.split("_")
        node_id = parts[0]
        pov_value = parts[4]
        query = table.select("direction").filter("pov", "eq", pov_value).filter("node_id", "eq", node_id)
        have_data = False
        try:
        # Execute the query
            response = query.execute()
            data = response.data

            if data:
                arrow_directions = [row['direction'] for row in data]
                #print("Retrieved arrow directions:", arrow_directions)
            else:
                print("No Data Returned")
        except Exception as e:
            print(f"Error: {e}")


        for i in arrow_directions:
            if i != "None":
                have_data = True
                background = Image.open(img_file_path)
                arrow_path = i + arrow_directory
                foreground = Image.open(arrow_path)
                # Resizing arrow
                if (i == "West") or (i == "East"):
                    foreground = foreground.resize((224, 148)) 
                else:
                    foreground = foreground.resize((148,224))
        
                # Position of arrow
                if (i == "Up") or (i == "Down"):
                    position = (275, 450)
                elif(i == "West"):
                    position = (225, 900)
                else:
                    position = (275, 900)
                # Adding arrow to background
                background.paste(foreground, position, foreground)
        
                # Saving image
        
                if len(parts) >= 6:
                    index_of_fifth_occurrence = base_name.find("_", base_name.find("_", base_name.find("_", base_name.find("_", base_name.find("_") + 1) + 1) + 1) + 1)
                    first_part = base_name[:index_of_fifth_occurrence]
                    end_part = base_name[index_of_fifth_occurrence + 6:]
             
                    modified_second_part = i
                    modified_base_name = first_part + "_" + modified_second_part + "_" + end_part
                    modified_file_name = modified_base_name + extension
                    output_path = os.path.join("./processedImages", modified_file_name)
                    background.save(output_path)
                    print(node_id)
                    #print(pov_value)
        
        if(have_data):
            if os.path.exists(img_file_path):
                os.remove(img_file_path)
        