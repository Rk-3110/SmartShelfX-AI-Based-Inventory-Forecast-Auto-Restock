package com.smartshelf.smartshelf.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.smartshelf.smartshelf.model.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    // Custom query method to check if a supplier name already exists
    boolean existsByName(String name);
}