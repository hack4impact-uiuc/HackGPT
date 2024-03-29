# 
FROM python:3.11

# 
WORKDIR /code

#
COPY ./.env /code/.env

# 
COPY ./requirements.txt /code/requirements.txt

# 
RUN pip3 install --no-cache-dir --upgrade -r /code/requirements.txt

#
COPY ./api /code/api

# 
CMD ["uvicorn", "api.index:app", "--host", "0.0.0.0", "--port", "8000"]