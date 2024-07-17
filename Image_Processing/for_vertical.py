from PIL import Image
import os

folder_path = "./Images_to_be_processed"

# Opening arrow to add on top

arrow_directory = "-arrow.png"

for file_name in os.listdir(folder_path):

    img_file_path = os.path.join(folder_path, file_name)

    if os.path.isfile(img_file_path):
        base_name, extension = os.path.splitext(file_name)

    background = Image.open(img_file_path)
    arrow_path = "North" + arrow_directory
    foreground = Image.open(arrow_path)
    foreground = foreground.resize((148,224))

    position = (275, 600)
    # Adding arrow to background
    background.paste(foreground, position, foreground)

    # Saving image

    output_path = os.path.join("./processedImages", file_name)
    background.save(output_path)
    #print(pov_value)
    
    if os.path.exists(img_file_path):
        os.remove(img_file_path)
        