package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"
)

type RGB struct {
	MRed   [][]uint32 `json:"mred,omitempty"`
	MGreen [][]uint32 `json:"mgreen,omitempty"`
	MBlue  [][]uint32 `json:"mblue,omitempty"`
	Red    uint32     `json:"red,omitempty"`
	Green  uint32     `json:"green,omitempty"`
	Blue   uint32     `json:"blue,omitempty"`
}

type Payload struct {
	Colors     *RGB `json:"colors,omitempty"`
	Power      bool `json:"power,omitempty"`
	Brightness int  `json:"brightness,omitempty"`
	LED        int  `json:"led,omitempty"`
}

func Run() {
	http.HandleFunc("/api/colors", changeColors)
	http.HandleFunc("/api/power", power)
	http.HandleFunc("/api/brightness", brightness)
	http.Handle("/", http.FileServer(http.Dir("./public")))

	if err := http.ListenAndServe(":8080", nil); err != nil {
		panic(err)
	}
}

func changeColors(w http.ResponseWriter, r *http.Request) {
	if r.Method != "PUT" {
		w.WriteHeader(http.StatusMethodNotAllowed)
		w.Write([]byte(""))
		return
	}

	p := &Payload{}

	json.NewDecoder(r.Body).Decode(&p)
	fmt.Printf("Request body: %+v\n", p.Colors)
}

func power(w http.ResponseWriter, r *http.Request) {
	p := &Payload{}

	json.NewDecoder(r.Body).Decode(&p)
	fmt.Printf("Request body: %+v\n", p)

	if !p.Power {

	} else {

	}
}

func brightness(w http.ResponseWriter, r *http.Request) {
	p := &Payload{}

	json.NewDecoder(r.Body).Decode(&p)
	fmt.Printf("Request body: %+v\n", p)

	if p.Brightness > 255 || p.Brightness < 0 {
		w.WriteHeader(http.StatusBadRequest)
		w.Write([]byte("Brightness must be between 0 and 255."))
		return
	}

	w.Write([]byte("Brightness changed."))
}
