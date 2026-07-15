from ultralytics import YOLO
import os
import sys

BASE_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(BASE_DIR, "best.pt")

model = YOLO(MODEL_PATH)

image = sys.argv[1]

results = model(image)

boxes = results[0].boxes

if len(boxes) == 0:
    print("Invalid")
else:
    cls = int(boxes[0].cls)
    print(model.names[cls])