migrate((db) => {
    const collection = new Collection({
        "name": "device_images",
        "type": "base",
        "system": false,
        "schema": [
            {
                "system": false,
                "id": "pbfield_device_id",
                "name": "device_id",
                "type": "text",
                "required": true,
                "presentable": false,
                "unique": false,
                "options": {
                    "min": null,
                    "max": null,
                    "pattern": ""
                }
            },
            {
                "system": false,
                "id": "pbfield_image",
                "name": "image",
                "type": "file",
                "required": true,
                "presentable": false,
                "unique": false,
                "options": {
                    "maxSelect": 1,
                    "maxSize": 5242880,
                    "mimeTypes": ["image/jpeg", "image/png", "image/svg+xml", "image/gif", "image/webp"],
                    "thumbs": [],
                    "protected": false
                }
            }
        ],
        "indexes": [],
        "listRule": "",
        "viewRule": "",
        "createRule": "",
        "updateRule": "",
        "deleteRule": "",
        "options": {}
    });

    return Dao(db).saveCollection(collection);
}, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("device_images");

    return dao.deleteCollection(collection);
})
