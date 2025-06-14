# FUA to edit this to fit the current project

from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom

ASSET_PATH = "user.png"
OUTPUT_FILE = "pmk_architecture"

with Diagram("PMK Architecture", show=False, filename=OUTPUT_FILE, outformat="png"):
    user = Custom("User", ASSET_PATH)
    with Cluster("Pebble Watch"):
        pebble_ui = Custom("UI Layer", "ui.png")
        app_logic = Custom("C Application Logic", "C.png")
        bluetooth = Custom("Bluetooth Stack", "bluetooth.png")
        pebble_ui >> Edge(label="Renders Data") << app_logic
        app_logic >> Edge(label="AppMessage") << bluetooth
    with Cluster("Android/iOS Phone"):
        pebblekit = Custom("PebbleKit JS", "javascript.png")
        oauth = Custom("OAuth 2.0 Flow", "auth.png")
        storage = Custom("Token Storage", "local.png")
        bluetooth - Edge(label="BLE Comm") - pebblekit
        pebblekit >> Edge(label="Stores") >> storage
        pebblekit >> Edge(label="API Calls") >> oauth
    with Cluster("Strava Cloud"):
        api = Custom("Strava v3 API", "strava.png")
        activities = Custom("Strava Activity Data", "data.png")
        oauth >> api >> activities
    with Cluster("Development Stack"):
        docker = Custom("Docker", "docker.png")
        make = Custom("Makefile", "makefile.png")
        sdk = Custom("Pebble SDK", "pebble.png")
        docker >> make >> sdk
    user >> Edge(label="Interacts with") >> pebble_ui
    oauth >> Edge(label="Access Token") >> api
    activities >> Edge(label="JSON Response", reverse=True) >> pebblekit