package com.clinicflow.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class BillRequest {

    @NotNull(message = "Appointment ID is required")
    private Long appointmentId;

    @DecimalMin(value = "0.0", inclusive = true, message = "Additional charges cannot be negative")
    private BigDecimal additionalCharges;

    @DecimalMin(value = "0.0", inclusive = true, message = "Discount cannot be negative")
    private BigDecimal discount;

    private String paymentMethod; // e.g., CASH, CREDIT_CARD, UPI, INSURANCE

    public Long getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Long appointmentId) {
        this.appointmentId = appointmentId;
    }

    public BigDecimal getAdditionalCharges() {
        return additionalCharges;
    }

    public void setAdditionalCharges(BigDecimal additionalCharges) {
        this.additionalCharges = additionalCharges;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }
}
