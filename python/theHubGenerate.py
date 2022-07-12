import os

import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore

from bs4 import BeautifulSoup
from urllib.request import urlopen
import re
from urllib.parse import urlparse

script_dir = os.path.dirname(__file__)

cred = credentials.Certificate(os.path.join(script_dir, "serviceAccountKey.json"))
firebase_admin.initialize_app(cred)

db = firestore.client()
batch = db.batch()

websites = db.collection("websites").get()
for website in websites:
    #batch.delete(db.collection("rules").document(website.id))
    for url in website.to_dict()["urls"]:
        with urlopen(url) as response:
            soup = BeautifulSoup(response, "html.parser")
            for anchor in soup.find_all(href=re.compile(".*\.pdf$")):
                pdfLink = anchor.get("href")
                parseResults = urlparse(url)
                parsedPath = parseResults.path.rsplit("/")
                parsedPath = parsedPath[len(parsedPath) - 2]

                if (pdfLink[0] != 'h' and pdfLink[0] != 'w'):
                    if (parsedPath in pdfLink):
                        pdfLink = 'https://' + parseResults.netloc + ("/" if pdfLink[0] == '.' or pdfLink[0] != '/' else "") + pdfLink
                        print("1: " + pdfLink)
                    else:
                        pdfLink = 'https://' + parseResults.netloc + ("/" if pdfLink[0] == '.' or pdfLink[0] != '/' else "") + pdfLink
                        print("2: " + pdfLink)
                batch.set(db.collection("rules").document((anchor.text + soup.title.text).replace('/', '')), {"pdfName": anchor.text, "pdfLink": pdfLink, "websiteName": soup.title.text, "state": website.id})

batch.commit()