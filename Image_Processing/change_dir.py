from PIL import Image
import os

folder_path = "./Images_to_be_processed"

# Opening arrow to add on top

for file_name in os.listdir(folder_path):

    img_file_path = os.path.join(folder_path, file_name)

    if os.path.isfile(img_file_path):
        base_name, extension = os.path.splitext(file_name)
        parts = base_name.split("_")
        node_id = parts[0]
        pov_value = parts[4]
    
    if(pov_value == 'North') :

        parts[4] = 'West'

    elif(pov_value == 'East') :

        parts[4] = 'North'

    elif(pov_value == 'South') :

        parts[4] = 'East'

    elif(pov_value == 'West') :
        
        parts[4] = 'South'

    background = Image.open(img_file_path)

    # Saving image
    filename = '_'.join(parts) + extension
    output_path = os.path.join("./processedImages", filename)
    background.save(output_path)
    #print(pov_value)
    
    if os.path.exists(img_file_path):
        os.remove(img_file_path)
        