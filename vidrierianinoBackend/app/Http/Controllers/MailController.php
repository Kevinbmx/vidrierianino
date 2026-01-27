<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Validator;

class MailController extends Controller
{
    public function send(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'message' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $to_email = env('MAIL_USERNAME');

        $from_email = env('MAIL_FROM_ADDRESS');

        try {
            Mail::raw($request->message, function ($message) use ($request, $to_email, $from_email) {
                $message->to($to_email)
                        ->subject('Nuevo mensaje de contacto de: ' . $request->name)
                        ->from($from_email, env('MAIL_FROM_NAME'))
                        ->replyTo($request->email, $request->name);
            });

            return response()->json(['message' => 'Correo enviado exitosamente']);

        } catch (\Exception $e) {
            return response()->json(['message' => 'Hubo un error al enviar el correo.', 'error' => $e->getMessage()], 500);
        }
    }
}
