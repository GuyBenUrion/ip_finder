FROM python:3.10-slim

# Set the working directory
WORKDIR /app

# install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your app's source code
COPY . .

# Expose port 8000
EXPOSE 8000

# Command to run the FastAPI app with uvicorn.
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
