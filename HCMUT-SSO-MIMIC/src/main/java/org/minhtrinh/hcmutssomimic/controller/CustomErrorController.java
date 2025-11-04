package org.minhtrinh.hcmutssomimic.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.http.HttpServletRequest;

@Controller
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public String handleError(HttpServletRequest request, Model model) {

        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);
        String errorMessage = "An unexpected error occurred";
        Integer statusCode = 500; // Default to 500

        if (status != null) {
            statusCode = Integer.valueOf(status.toString());

            // Get the default error message for the status code
            errorMessage = HttpStatus.valueOf(statusCode).getReasonPhrase();
        }

        // Add all error details to the model
        model.addAttribute("status", statusCode);
        model.addAttribute("error", errorMessage);

        // This is the custom message from the exception, if it exists
        Object exceptionMessage = request.getAttribute(RequestDispatcher.ERROR_MESSAGE);
        if (exceptionMessage != null) {
            model.addAttribute("message", exceptionMessage.toString());
        }

        // Tell Spring to render the 'error.html' template
        return "error";
    }
}