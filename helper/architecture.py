from diagrams import Diagram, Cluster, Edge
from diagrams.custom import Custom

ASSET_PATH = "user.png"
OUTPUT_FILE = "kamaji_architecture"

with Diagram("Kamaji Architecture", show=False, filename=OUTPUT_FILE, outformat="png"):
    user = Custom("User", ASSET_PATH)
    
    with Cluster("Amazfit Watch"):
        watch_ui = Custom("Watch UI", "ui.png")
        js_logic = Custom("ZeppOS JavaScript", "javascript.png")
        ble_stack = Custom("BLE Stack", "bluetooth.png")
        storage = Custom("Local Storage", "storage.png")
        
        watch_ui >> Edge(label="Renders Data") << js_logic
        js_logic >> Edge(label="Reads/Writes") >> storage
        js_logic >> Edge(label="BLE Comm") >> ble_stack

    with Cluster("Companion Web App"):
        react_ui = Custom("React UI", "react.png")
        web_ble = Custom("Web Bluetooth", "bluetooth.png")
        local_storage = Custom("Transaction Storage", "database.png")
        
        react_ui >> Edge(label="Manages") >> local_storage
        react_ui >> Edge(label="Controls") >> web_ble

    with Cluster("Development Stack"):
        docker = Custom("Docker", "docker.png")
        make = Custom("Makefile", "makefile.png")
        zeus = Custom("Zeus CLI", "sdk.png")
        docker >> make >> zeus

    user >> Edge(label="Interacts with") >> watch_ui
    ble_stack - Edge(label="BLE Sync", style="dashed") - web_ble
    web_ble >> Edge(label="Data Sync") >> react_ui
    react_ui >> Edge(label="Persists Data") >> local_storage
    zeus >> Edge(label="Builds & Deploys") >> watch_ui