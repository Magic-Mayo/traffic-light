package httpserver

import (
	"encoding/json"
	"fmt"
	"net/http"

	led "github.com/Magic-Mayo/traffic-light/pkg/ws281x"
)

var (
	l *led.LED
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

	l = led.Initialize()
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

	if err := l.ChangeColors(p.Colors.MRed, p.Colors.MGreen, p.Colors.MBlue); err != nil {
		fmt.Printf("Error changing colors. err: %s\n", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error changing colors."))
		return
	} else {
		w.Write([]byte("All colors changed."))
		return
	}
}

func power(w http.ResponseWriter, r *http.Request) {
	p := &Payload{}

	json.NewDecoder(r.Body).Decode(&p)
	fmt.Printf("Request body: %+v\n", p)

	if !p.Power {
		if err := l.SetBrightness(0, 0); err != nil {
			fmt.Printf("Error setting brightness: %+V\n", err)
		}
		l.Fini()
		w.Write([]byte(""))
		return
	} else {
		if err := l.Init(); err != nil {
			fmt.Printf("Error initializing LED board: %s\n", err.Error())
			w.WriteHeader(http.StatusInternalServerError)
			w.Write([]byte("Error initializing LED board."))
			return
		} else {
			if err := l.SetBrightness(0, led.InitBrightness); err != nil {
				fmt.Printf("Error setting brightness: %+V\n", err)
				w.WriteHeader(http.StatusInternalServerError)
				w.Write([]byte("Error setting brightness"))
				return
			}
			w.Write([]byte(""))
			return
		}
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
	if err := l.SetBrightness(0, p.Brightness); err != nil {
		fmt.Printf("Error changing brightness. err: %s\n", err.Error())
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("Error changing brightness."))
		return
	}
	w.Write([]byte("Brightness changed."))
}
