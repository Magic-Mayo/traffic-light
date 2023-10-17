package utils

import (
	"log/slog"
)

func ShouldPanic(err error) {
	if err != nil {
		slog.Error("Unrecoverable error.", "err", err)
		panic(err)
	}
}
