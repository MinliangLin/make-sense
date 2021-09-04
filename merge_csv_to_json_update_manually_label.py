# merge csv into json
import sys
import json
import pandas as pd

c_fp, j_fp, new_j_fp = sys.argv[1:4]

with open(j_fp) as f:
    j = json.load(f)

name2id ={i["file_name"]: i["id"] for i in j['images']}
c = pd.read_csv(c_fp, names=['label', 'x', 'y', 'w', 'h', 'img', 'img_w', 'img_h'])


dc = {}
for i in c.itertuples():
    imgid = name2id[i.img]
    x = {"image_id": imgid, "category_id": 0, "bbox": [i.x, i.y, i.w, i.h]}
    if imgid in dc:
        dc[imgid].append(x)
    else:
        dc[imgid] = [x]


ann = []
for k, v in dc.items():
    ann += v

for i in j['annotations']:
    if i['image_id'] not in dc:
        ann.append(i)

j['annotations'] = ann

with open(new_j_fp, 'w') as f:
    json.dump(j, f)

