// This is a hotfix using ChatGPT to convert the .ts file into whatever it suggested to be faster on macOS.
// To install Go, use `brew install go`.
// Then use `go run ./mapillary/updateDeduplicate.go`

package main

import (
    "fmt"
    "io/ioutil"
    "os"
    "strings"
)
import "encoding/json"

func main() {
    fmt.Println("START", "Starting", os.Args[0])

    // PART 1
    fmt.Println("INFO", "Handle debugPicture")
    debugPicturesBytes, err := ioutil.ReadFile("./data/current/picturesDebuggingApiData.geojsonl")
    if err != nil {
        panic(err)
    }
    debugPictures := parseGeojsonL(debugPicturesBytes, debuggingPictureFeature)
    filteredDebugPictures := removeDuplicates(debugPictures)
    fmt.Println("INFO", "Handle debugPicture", "before:", len(debugPictures), "after:", len(filteredDebugPictures))

    debugPicturesFile, err := os.Create("./data/current/picturesDebuggingApiData_filtered.geojsonl")
    if err != nil {
        panic(err)
    }
    defer debugPicturesFile.Close()

    for _, line := range filteredDebugPictures {
        fmt.Fprintln(debugPicturesFile, lineFromObject(line))
    }

    // PART 2
    fmt.Println("INFO", "Handle pictures")
    picturesBytes, err := ioutil.ReadFile("./data/current/pictures.geojsonl")
    if err != nil {
        panic(err)
    }
    pictures := parseGeojsonL(picturesBytes, pictureFeature)
    filteredPictures := removeDuplicates(pictures)
    fmt.Println("INFO", "Handle pictures", "before:", len(pictures), "after:", len(filteredPictures))

    picturesFile, err := os.Create("./data/current/pictures_filtered.geojsonl")
    if err != nil {
        panic(err)
    }
    defer picturesFile.Close()

    for _, line := range filteredPictures {
        fmt.Fprintln(picturesFile, lineFromObject(line))
    }
}

func parseGeojsonL(data []byte, featureFunc func(map[string]interface{}) interface{}) []interface{} {
    lines := strings.Split(string(data), "\n")
    features := make([]interface{}, 0, len(lines))
    for _, line := range lines {
        if line == "" {
            continue
        }
        var feature map[string]interface{}
        if err := json.Unmarshal([]byte(line), &feature); err != nil {
            panic(err)
        }
        features = append(features, featureFunc(feature))
    }
    return features
}

func removeDuplicates(features []interface{}) []interface{} {
    uniqueFeatures := make([]interface{}, 0, len(features))
    seenFeatures := make(map[string]struct{})
    for _, feature := range features {
        featureStr := fmt.Sprintf("%v", feature)
        if _, ok := seenFeatures[featureStr]; !ok {
            uniqueFeatures = append(uniqueFeatures, feature)
            seenFeatures[featureStr] = struct{}{}
        }
    }
    return uniqueFeatures
}

func lineFromObject(obj interface{}) string {
    lineBytes, err := json.Marshal(obj)
    if err != nil {
        panic(err)
    }
    return string(lineBytes)
}

func debuggingPictureFeature(feature map[string]interface{}) interface{} {
    return feature
}

func pictureFeature(feature map[string]interface{}) interface{} {
    return feature
}
