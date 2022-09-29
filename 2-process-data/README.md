# Process data

## TODOs

Known TODOs…

- Update the model to work with the new data set from; it was created based on a test data set with different fields
- Remove the data filter; we are doing this more easily in step 1
- Improve highway layer before processing the Mapillary Points since that will result it results that are a lot easier to use.
   1. Merge highways based on name + type
   2. Split highways on relevant junctions (eg. whenever a highway meets a highways, but not a driveway or footway)
