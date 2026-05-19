import os
import sys
import time
from gradio_client import Client, handle_file

def test_local_gradio():
    print("Testing local VTON Gradio Client on M4...")
    user_img_path = "/Users/umitcancinar/Desktop/kullanıcıdeneyimi/frontend/assets/model_man.jpg"
    garment_img_path = "/Users/umitcancinar/Desktop/kullanıcıdeneyimi/frontend/assets/garment_blue_hoodie.jpg"

    if not os.path.exists(user_img_path):
        print(f"User image not found at {user_img_path}")
        sys.exit(1)
    if not os.path.exists(garment_img_path):
        print(f"Garment image not found at {garment_img_path}")
        sys.exit(1)

    try:
        start_time = time.time()
        client = Client("http://127.0.0.1:7860/")
        
        # Structure payload for local IDM-VTON API
        dict_payload = {
            "background": handle_file(user_img_path),
            "layers": [],
            "composite": None
        }
        
        print("Sending predict request to http://127.0.0.1:7860/api/tryon ...")
        result = client.predict(
            dict=dict_payload,
            garm_img=handle_file(garment_img_path),
            garment_des="mavi kapüşonlu sweatshirt",
            is_checked=True,
            is_checked_crop=False,
            denoise_steps=30,
            seed=42,
            api_name="/tryon"
        )
        
        elapsed = time.time() - start_time
        print(f"Predict completed in {elapsed:.2f} seconds!")
        print("Result type:", type(result))
        print("Result content:", result)
        
    except Exception as e:
        print("Error during predict:", str(e))
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_local_gradio()
