run:
	@echo "Starting server..."
	@python3 -m http.server -d public 8000 &
	@echo "Server started on http://localhost:8000"
	@sleep 1 && xdg-open http://localhost:8000

stop:
	@echo "Stopping server..."
	@kill $$(lsof -t -i:8000)
