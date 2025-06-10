# Gradio example
import gradio as gr

def my_function(input):
    return input[::-1]

app = gr.Interface(fn=my_function, inputs="text", outputs="text")

app.launch() 

