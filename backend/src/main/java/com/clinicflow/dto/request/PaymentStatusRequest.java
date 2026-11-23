package com.clinicflow.dto.request;

import com.clinicflow.entity.PaymentStatus;
import jakarta.validation.constraints.NotNull;

public class PaymentStatusRequest {
    @NotNull(message = "Payment status is required")
    private PaymentStatus paymentStatus;

    private String paymentMethod;

    public PaymentStatus getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(PaymentStatus paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
