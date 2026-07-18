from ultralytics import YOLO
import sys

model = YOLO("best.pt")

image = sys.argv[1]

results = model(image)

boxes = results[0].boxes

if len(boxes)==0:
    print("irrelevant")
else:
    cls=int(boxes[0].cls)
    print(model.names[cls])