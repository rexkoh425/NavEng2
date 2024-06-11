from PIL import Image
import os

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
        arrow_directions = ["North", "West", "East"]


        for i in arrow_directions:
            background = Image.open(img_file_path)
            arrow_path = i + arrow_directory
            foreground = Image.open(arrow_path)
            # Resizing arrow
            foreground = foreground.resize((224, 148)) 
        
            # Position of arrow
            position = (250, 900)
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
                print(pov_value)

        