package led

import (
	"errors"

	"github.com/Magic-Mayo/traffic-light/internal/utils"
)

var (
	Width          = 8
	Height         = 4 // Use 1 for LED strip
	ledCount       = Width * Height
	InitBrightness = 75
	shouldPanic    = utils.ShouldPanic
	Gpio           = 18
	Freq           = 800000
)

type ws interface {
	Init() error
	Render() error
	Wait() error
	Fini()
	SetBrightness(channel int, b int)
	Leds(channel int) []uint32
}

type L interface {
	ChangeAllColors(r uint32, g uint32, b uint32)
	ChangeColors(r [][]uint32, g [][]uint32, b [][]uint32)
	ChangeColor(r uint32, g uint32, b uint32)
}

type LED struct {
	Power      bool
	Brightness uint8
	LedMatrix  map[int]uint32
	ws
	L
}

// Initializes LED board and panics with an error
func Initialize() *LED {
	var err error

	led := LED{
		LedMatrix: map[int]uint32{},
	}

	shouldPanic(err)
	shouldPanic(led.Init())
	led.InitMatrix()
	shouldPanic(led.Render())
	shouldPanic(led.Wait())
	return &led
}

// Sets brightness of the LED board. Accepts 0-255
func (led *LED) SetBrightness(channel int, b int) error {
	if b > 255 || b < 0 {
		return errors.New("brightness value must be between 0 and 255")
	}

	led.ws.SetBrightness(0, b)
	return led.Render()
}

// Converts to the RGB values into a 'color' value
func rgbToColor(r uint32, g uint32, b uint32) uint32 {
	return uint32(uint32(r)<<16 | uint32(g)<<8 | uint32(b))
}

// Change color of an individual LED. Accepts separate R, G, and B values as well as the
// coordinate value of the LED to change
func (led *LED) ChangeColor(r uint32, g uint32, b uint32, nL int) {
	led.LedMatrix[nL] = rgbToColor(r, g, b)
	led.ws.Leds(0)[nL] = led.LedMatrix[nL]
}

/*
Accepts a matrix of rgb values.
Will change the color of each LED individually according to the yx matrix.

Given a matrix like the following on a 4x8 board for one of R, G, or B:

[

	[0,0,0,0,0,0,0,0]
	[63,63,63,63,63,63,63,63]
	[127,127,127,127,127,127,127,127]
	[255,255,255,255,255,255,255,255]

]

translates to row 1 having 0 of R, G, or B
row 2 having 63, row 3 having 127 and row 4 having 255.
*/
func (led *LED) ChangeColors(r [][]uint32, g [][]uint32, b [][]uint32) error {
	led.loopWithCoords(func(x int, y int) { led.ChangeColor(r[x][y], g[x][y], b[x][y], x*Height+y) })

	return led.Render()
}

// Accepts a single rgb value. Will change the color of all LEDs on the board to this value.
func (led *LED) ChangeAllColors(r uint32, g uint32, b uint32) error {
	led.loopLeds(func(coord int) { led.ChangeColor(r, g, b, coord) })

	return led.Render()
}

// Gets the current color matrix for the LED board.
func (led *LED) GetColorMatrix() map[int]uint32 {
	return led.LedMatrix
}

// Creates a matrix with all RGB values set at 0
func (led *LED) InitMatrix() {
	led.loopLeds(func(coord int) { led.ChangeColor(0, 0, 0, coord) })
}

// Loops dimensions of the LED board and processes the given func by passing in x and y points.
func (led *LED) loopWithCoords(work func(x int, y int)) {
	for x := 0; x < Width; x++ {
		for y := 0; y < Height; y++ {
			work(x, y)
		}
	}
}

// Helper for LED.loopWithCoords. Passes in coordinate point instead of x and y
func (led *LED) loopLeds(work func(coord int)) {
	led.loopWithCoords(func(x int, y int) { work(x*Height + y) })
}
