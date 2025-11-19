docker build -t lints-dev -f docker/Dockerfile .
docker run -it --rm -v "$(pwd)":/workspace -w /workspace lints-dev